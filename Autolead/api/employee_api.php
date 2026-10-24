<?php
declare(strict_types=1);

/**
 * AutoLead Employee Panel REST API Endpoint
 * Path: C:/xampp/htdocs/autolead/api/employee_api.php
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

$currentUser  = requireRole('employee');
$employeeCode = $currentUser['employee_code'];
$pdo          = Database::getConnection();
$method       = $_SERVER['REQUEST_METHOD'];
$reqData      = getRequestData();
$action       = $_GET['action'] ?? ($reqData['action'] ?? 'dashboard');

/**
 * Synchronize overdue status for pending tasks past their due_date
 */
function syncEmployeeOverdueTasks(PDO $pdo, string $empCode): void
{
    $stmt = $pdo->prepare(
        "UPDATE tasks
         SET status = 'Overdue'
         WHERE assigned_to = :emp AND status = 'Pending' AND due_date < CURDATE()"
    );
    $stmt->execute([':emp' => $empCode]);
}

syncEmployeeOverdueTasks($pdo, $employeeCode);

// ============================================================================
// GET REQUEST HANDLERS
// ============================================================================
if ($method === 'GET') {

    // 1. EMPLOYEE WORKSPACE DASHBOARD
    if ($action === 'dashboard') {
        // 4-Week Personal Lead Growth Chart (Week 1 to Week 4)
        $weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4 (Current)'];
        $weekValues = [];
        $intervals  = [
            [28, 21],
            [21, 14],
            [14, 7],
            [7, 0]
        ];

        foreach ($intervals as [$startDays, $endDays]) {
            $stmt = $pdo->prepare(
                "SELECT COUNT(*)
                 FROM leads
                 WHERE assigned_to = :emp
                   AND created_at >= DATE_SUB(NOW(), INTERVAL :start_d DAY)
                   AND created_at <= DATE_SUB(NOW(), INTERVAL :end_d DAY)"
            );
            $stmt->execute([
                ':emp'     => $employeeCode,
                ':start_d' => $startDays,
                ':end_d'   => $endDays
            ]);
            $weekValues[] = (int) $stmt->fetchColumn();
        }

        // My Lead Funnel (Active, non-exhausted leads prioritized)
        $funnelStmt = $pdo->prepare(
            "SELECT id, lead_name, email, phone, source, lead_score,
                    lead_stage, activity_status, is_escalated, is_exhausted,
                    created_at, modified_at
             FROM leads
             WHERE assigned_to = :emp AND is_exhausted = 0
             ORDER BY is_escalated DESC, modified_at DESC"
        );
        $funnelStmt->execute([':emp' => $employeeCode]);
        $myLeadFunnel = $funnelStmt->fetchAll();

        // My New Leads (lead_stage = 'New' AND is_exhausted = 0)
        $newLeadsStmt = $pdo->prepare(
            "SELECT id, lead_name, email, phone, source, lead_score,
                    lead_stage, created_at, modified_at
             FROM leads
             WHERE assigned_to = :emp AND lead_stage = 'New' AND is_exhausted = 0
             ORDER BY created_at DESC"
        );
        $newLeadsStmt->execute([':emp' => $employeeCode]);
        $myNewLeads = $newLeadsStmt->fetchAll();

        foreach ($myNewLeads as &$nl) {
            $nl['created_formatted'] = formatRelativeTime($nl['created_at']);
        }
        unset($nl);

        // Recently Assigned Leads (Most recent 6 leads assigned to this employee)
        $recentStmt = $pdo->prepare(
            "SELECT id, lead_name, email, phone, source, lead_score,
                    lead_stage, is_escalated, is_exhausted, created_at, modified_at
             FROM leads
             WHERE assigned_to = :emp AND is_exhausted = 0
             ORDER BY created_at DESC
             LIMIT 6"
        );
        $recentStmt->execute([':emp' => $employeeCode]);
        $recentlyAssigned = $recentStmt->fetchAll();

        foreach ($recentlyAssigned as &$ra) {
            $ra['assigned_formatted'] = formatRelativeTime($ra['created_at']);
        }
        unset($ra);

        // Overdue Tasks (Assigned to employee where status = 'Overdue' or past due)
        $overdueStmt = $pdo->prepare(
            "SELECT t.id, t.task_code, t.lead_id, l.lead_name,
                    t.subject, t.source, t.due_date, t.status, t.reminder_active
             FROM tasks t
             INNER JOIN leads l ON t.lead_id = l.id
             WHERE t.assigned_to = :emp
               AND (t.status = 'Overdue' OR (t.due_date < CURDATE() AND t.status != 'Complete'))
             ORDER BY t.due_date ASC"
        );
        $overdueStmt->execute([':emp' => $employeeCode]);
        $overdueTasks = $overdueStmt->fetchAll();

        foreach ($overdueTasks as &$ot) {
            $ot['due_formatted'] = date('d M Y', strtotime($ot['due_date']));
        }
        unset($ot);

        // Determine current active lead candidate for the prominent "COMPLETE TASK" button
        $activeTarget = !empty($myLeadFunnel) ? $myLeadFunnel[0] : null;

        sendJson([
            'success'           => true,
            'employee'          => $currentUser,
            'active_lead'       => $activeTarget,
            'active_queue_count'=> count($myLeadFunnel),
            'growth_chart'      => [
                'labels' => $weekLabels,
                'values' => $weekValues
            ],
            'my_lead_funnel'    => $myLeadFunnel,
            'my_new_leads'      => $myNewLeads,
            'recently_assigned' => $recentlyAssigned,
            'overdue_tasks'     => $overdueTasks
        ]);
    }

    // 2. SMART VIEWS (5-Tab Categorized Interface)
    if ($action === 'smart_views') {
        // Tab 1: New Leads
        $newStmt = $pdo->prepare(
            "SELECT l.id, l.lead_name, l.email, l.phone, l.source, l.lead_score,
                    l.lead_stage, l.assigned_to, l.created_at, l.modified_at,
                    COALESCE(
                        (SELECT i.notes FROM interactions i WHERE i.lead_id = l.id ORDER BY i.interaction_date DESC LIMIT 1),
                        'Awaiting initial outreach call'
                    ) AS feedback_notes
             FROM leads l
             WHERE l.assigned_to = :emp AND l.lead_stage = 'New' AND l.is_exhausted = 0
             ORDER BY l.created_at DESC"
        );
        $newStmt->execute([':emp' => $employeeCode]);
        $newLeads = $newStmt->fetchAll();
        foreach ($newLeads as &$row) {
            $row['created_formatted']  = date('d M Y', strtotime($row['created_at']));
            $row['modified_formatted'] = formatRelativeTime($row['modified_at']);
        }
        unset($row);

        // Tab 2: Prospects (Prospect or Negotiation stages)
        $prospectStmt = $pdo->prepare(
            "SELECT l.id, l.lead_name, l.lead_score, l.lead_stage,
                    l.assigned_to, u.full_name AS owner_name,
                    l.modified_at
             FROM leads l
             LEFT JOIN users u ON l.assigned_to = u.employee_code
             WHERE l.assigned_to = :emp AND l.lead_stage IN ('Prospect', 'Negotiation') AND l.is_exhausted = 0
             ORDER BY l.lead_score DESC, l.modified_at DESC"
        );
        $prospectStmt->execute([':emp' => $employeeCode]);
        $prospects = $prospectStmt->fetchAll();
        foreach ($prospects as &$row) {
            $row['modified_formatted'] = formatRelativeTime($row['modified_at']);
        }
        unset($row);

        // Tab 3: Incoming Calls
        $inCallStmt = $pdo->prepare(
            "SELECT i.id, i.lead_id, l.lead_name, i.interaction_date,
                    i.call_status, i.call_duration, i.call_record_url,
                    i.employee_code, u.full_name AS owner_name, i.notes
             FROM interactions i
             INNER JOIN leads l ON i.lead_id = l.id
             LEFT JOIN users u ON i.employee_code = u.employee_code
             WHERE i.employee_code = :emp AND i.interaction_type = 'Inbound Call'
             ORDER BY i.interaction_date DESC"
        );
        $inCallStmt->execute([':emp' => $employeeCode]);
        $incomingCalls = $inCallStmt->fetchAll();
        foreach ($incomingCalls as &$row) {
            $row['start_time']      = date('d M Y, h:i A', strtotime($row['interaction_date']));
            $row['call_record_url'] = $row['call_record_url'] ?: 'records/inbound_sample.mp3';
        }
        unset($row);

        // Tab 4: Outgoing Calls
        $outCallStmt = $pdo->prepare(
            "SELECT i.id, i.lead_id, l.lead_name, i.interaction_date,
                    i.call_status, i.call_duration, i.call_record_url,
                    i.employee_code, u.full_name AS owner_name, i.notes
             FROM interactions i
             INNER JOIN leads l ON i.lead_id = l.id
             LEFT JOIN users u ON i.employee_code = u.employee_code
             WHERE i.employee_code = :emp AND i.interaction_type = 'Outbound Call'
             ORDER BY i.interaction_date DESC"
        );
        $outCallStmt->execute([':emp' => $employeeCode]);
        $outgoingCalls = $outCallStmt->fetchAll();
        foreach ($outgoingCalls as &$row) {
            $row['start_time']      = date('d M Y, h:i A', strtotime($row['interaction_date']));
            $row['call_record_url'] = $row['call_record_url'] ?: 'records/outbound_sample.mp3';
        }
        unset($row);

        // Tab 5: Follow-ups (Tasks assigned to employee)
        $followupStmt = $pdo->prepare(
            "SELECT t.id, t.task_code, t.lead_id, l.lead_name,
                    t.subject, t.status, t.due_date, t.reminder_active,
                    t.assigned_to, u.full_name AS owner_name
             FROM tasks t
             INNER JOIN leads l ON t.lead_id = l.id
             LEFT JOIN users u ON t.assigned_to = u.employee_code
             WHERE t.assigned_to = :emp
             ORDER BY
                CASE WHEN t.status = 'Overdue' THEN 0 WHEN t.status = 'Pending' THEN 1 ELSE 2 END ASC,
                t.due_date ASC"
        );
        $followupStmt->execute([':emp' => $employeeCode]);
        $followups = $followupStmt->fetchAll();
        foreach ($followups as &$row) {
            $row['due_formatted'] = date('d M Y', strtotime($row['due_date']));
        }
        unset($row);

        sendJson([
            'success'        => true,
            'employee'       => $currentUser,
            'new_leads'      => $newLeads,
            'prospects'      => $prospects,
            'incoming_calls' => $incomingCalls,
            'outgoing_calls' => $outgoingCalls,
            'followups'      => $followups
        ]);
    }

    // 3. MANAGE LEADS TABLE
    if ($action === 'manage_leads') {
        $stmt = $pdo->prepare(
            "SELECT l.id, l.lead_name, l.email, l.phone, l.source,
                    l.lead_score, l.lead_stage, l.activity_status,
                    l.is_escalated, l.is_exhausted, l.assigned_to,
                    u.full_name AS owner_name, l.created_at, l.modified_at
             FROM leads l
             LEFT JOIN users u ON l.assigned_to = u.employee_code
             WHERE l.assigned_to = :emp
             ORDER BY l.modified_at DESC"
        );
        $stmt->execute([':emp' => $employeeCode]);
        $leads = $stmt->fetchAll();

        foreach ($leads as &$lead) {
            $lead['modified_formatted'] = formatRelativeTime($lead['modified_at']);
            $lead['created_formatted']  = date('d M Y, h:i A', strtotime($lead['created_at']));
        }
        unset($lead);

        sendJson([
            'success'  => true,
            'employee' => $currentUser,
            'leads'    => $leads
        ]);
    }

    // 4. MANAGE ACTIVITY TABLE
    if ($action === 'manage_activities') {
        $stmt = $pdo->prepare(
            "SELECT i.id, i.lead_id, l.lead_name, i.interaction_type,
                    i.notes, i.call_status, i.call_duration,
                    i.resolution_status, i.interaction_date,
                    i.employee_code, u.full_name AS owner_name
             FROM interactions i
             INNER JOIN leads l ON i.lead_id = l.id
             LEFT JOIN users u ON i.employee_code = u.employee_code
             WHERE i.employee_code = :emp
             ORDER BY i.interaction_date DESC, i.id DESC"
        );
        $stmt->execute([':emp' => $employeeCode]);
        $activities = $stmt->fetchAll();

        foreach ($activities as &$act) {
            $act['activity_date_formatted'] = formatRelativeTime($act['interaction_date']);
        }
        unset($act);

        // Also provide assigned leads list for the quick-add activity bar
        $leadsStmt = $pdo->prepare(
            "SELECT id, lead_name, lead_stage FROM leads WHERE assigned_to = :emp ORDER BY lead_name ASC"
        );
        $leadsStmt->execute([':emp' => $employeeCode]);
        $assignedLeads = $leadsStmt->fetchAll();

        sendJson([
            'success'        => true,
            'employee'       => $currentUser,
            'activities'     => $activities,
            'assigned_leads' => $assignedLeads
        ]);
    }

    // 5. MANAGE TASK TABLE
    if ($action === 'manage_tasks') {
        $stmt = $pdo->prepare(
            "SELECT t.id, t.task_code, t.lead_id, l.lead_name,
                    t.subject, t.source, t.due_date, t.status,
                    t.reminder_active, t.completed_at,
                    t.assigned_to, u.full_name AS owner_name
             FROM tasks t
             INNER JOIN leads l ON t.lead_id = l.id
             LEFT JOIN users u ON t.assigned_to = u.employee_code
             WHERE t.assigned_to = :emp
             ORDER BY
                CASE WHEN t.status = 'Overdue' THEN 0 WHEN t.status = 'Pending' THEN 1 ELSE 2 END ASC,
                t.due_date ASC"
        );
        $stmt->execute([':emp' => $employeeCode]);
        $tasks = $stmt->fetchAll();

        $today = date('Y-m-d');
        foreach ($tasks as &$task) {
            $isOverdue = ($task['status'] === 'Overdue')
                || ($task['status'] !== 'Complete' && $task['due_date'] < $today);
            $task['is_overdue']     = $isOverdue;
            $task['due_formatted']  = date('d M Y', strtotime($task['due_date']));
            $task['reminder_label'] = ((int) $task['reminder_active'] === 1) ? 'On' : 'Off';
        }
        unset($task);

        sendJson([
            'success'  => true,
            'employee' => $currentUser,
            'tasks'    => $tasks
        ]);
    }

    // 6. EMAIL CAMPAIGNS MONITOR
    if ($action === 'campaigns') {
        $statusFilter = trim((string) ($_GET['status'] ?? 'all'));
        $params = [];
        $where  = '';

        if (in_array($statusFilter, ['Running', 'Scheduled', 'Complete'], true)) {
            $where = 'WHERE c.status = :status';
            $params[':status'] = $statusFilter;
        }

        $sql = "
            SELECT c.id, c.campaign_name, c.status, c.schedule_date,
                   c.last_activity, c.recipients_count, c.open_rate,
                   c.click_rate, c.assigned_to, u.full_name AS owner_name
            FROM campaigns c
            LEFT JOIN users u ON c.assigned_to = u.employee_code
            {$where}
            ORDER BY
                CASE WHEN c.assigned_to = :emp_sort THEN 0 ELSE 1 END ASC,
                c.schedule_date DESC
        ";
        $params[':emp_sort'] = $employeeCode;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $campaigns = $stmt->fetchAll();

        foreach ($campaigns as &$camp) {
            $camp['schedule_formatted']      = date('d M Y', strtotime($camp['schedule_date']));
            $camp['last_activity_formatted'] = date('d M Y', strtotime($camp['last_activity']));
        }
        unset($camp);

        sendJson([
            'success'       => true,
            'employee'      => $currentUser,
            'active_status' => $statusFilter,
            'campaigns'     => $campaigns
        ]);
    }
}

// ============================================================================
// POST / PUT MUTATION HANDLERS
// ============================================================================
if (in_array($method, ['POST', 'PUT'], true)) {

    // 1. THE "COMPLETE TASK" (LEAD EXHAUSTION) WORKFLOW TRIGGER
    if ($action === 'complete_task_exhaustion') {
        $leadId = isset($reqData['lead_id']) ? (int) $reqData['lead_id'] : 0;

        // If no specific lead_id passed, select top active non-exhausted lead for this employee
        if ($leadId <= 0) {
            $findStmt = $pdo->prepare(
                "SELECT id, lead_name, lead_stage
                 FROM leads
                 WHERE assigned_to = :emp AND is_exhausted = 0
                 ORDER BY is_escalated DESC, modified_at DESC
                 LIMIT 1"
            );
            $findStmt->execute([':emp' => $employeeCode]);
            $targetLead = $findStmt->fetch();
        } else {
            $findStmt = $pdo->prepare(
                "SELECT id, lead_name, lead_stage
                 FROM leads
                 WHERE id = :id AND assigned_to = :emp
                 LIMIT 1"
            );
            $findStmt->execute([':id' => $leadId, ':emp' => $employeeCode]);
            $targetLead = $findStmt->fetch();
        }

        if (!$targetLead) {
            sendJson([
                'success' => false,
                'message' => 'All assigned leads in your active workspace queue have already been completed.'
            ], 400);
        }

        $targetId = (int) $targetLead['id'];
        $outcome  = 'Not sure';
        if ($targetLead['lead_stage'] === 'Closed Won') {
            $outcome = 'Yes';
        } elseif ($targetLead['lead_stage'] === 'Closed Lost') {
            $outcome = 'No';
        } else {
            // Completing a nurtured lead in active pipeline marks it Checked & Converted
            $outcome = 'Yes';
        }

        try {
            $pdo->beginTransaction();

            // Mark lead as exhausted, checked, and update modified_at
            $updLead = $pdo->prepare(
                "UPDATE leads
                 SET is_exhausted = 1,
                     is_escalated = 0,
                     activity_status = 'Checked',
                     conversion_outcome = :outcome,
                     modified_at = NOW()
                 WHERE id = :id AND assigned_to = :emp"
            );
            $updLead->execute([
                ':outcome' => $outcome,
                ':id'      => $targetId,
                ':emp'     => $employeeCode
            ]);

            // Mark all associated tasks for this lead as Complete & turn off reminders
            $updTasks = $pdo->prepare(
                "UPDATE tasks
                 SET status = 'Complete',
                     reminder_active = 0,
                     completed_at = NOW()
                 WHERE lead_id = :lead_id AND assigned_to = :emp"
            );
            $updTasks->execute([
                ':lead_id' => $targetId,
                ':emp'     => $employeeCode
            ]);

            // Log exhaustion audit entry in interactions
            $insLog = $pdo->prepare(
                "INSERT INTO interactions (
                    lead_id, employee_code, interaction_type, notes,
                    call_status, call_duration, call_record_url, resolution_status, interaction_date
                 ) VALUES (
                    :lead_id, :emp, 'Note', :notes,
                    'N/A', '00:00', '', 'Completed', NOW()
                 )"
            );
            $insLog->execute([
                ':lead_id' => $targetId,
                ':emp'     => $employeeCode,
                ':notes'   => sprintf(
                    'Employee %s executed COMPLETE TASK workflow. Lead "%s" marked exhausted and all deliverables finalized.',
                    $employeeCode,
                    $targetLead['lead_name']
                )
            ]);

            $pdo->commit();

            sendJson([
                'success'   => true,
                'lead_id'   => $targetId,
                'lead_name' => $targetLead['lead_name'],
                'message'   => sprintf(
                    'Lead "%s" completed and cleared from active daily queue. Admin analytics updated.',
                    $targetLead['lead_name']
                )
            ]);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            sendJson([
                'success' => false,
                'message' => 'Error completing lead task workflow: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. UPDATE LEAD STAGE (From employee/manage-lead.html)
    if ($action === 'update_lead_stage') {
        $leadId    = (int) ($reqData['lead_id'] ?? 0);
        $leadStage = trim((string) ($reqData['lead_stage'] ?? ''));
        $validStages = ['New', 'Prospect', 'Negotiation', 'Closed Won', 'Closed Lost'];

        if ($leadId <= 0 || !in_array($leadStage, $validStages, true)) {
            sendJson([
                'success' => false,
                'message' => 'Invalid lead ID or stage selection.'
            ], 400);
        }

        $outcome = 'Not sure';
        $activityStatus = 'Active';
        if ($leadStage === 'Closed Won') {
            $outcome = 'Yes';
            $activityStatus = 'Checked';
        } elseif ($leadStage === 'Closed Lost') {
            $outcome = 'No';
            $activityStatus = 'Inactive';
        }

        $stmt = $pdo->prepare(
            "UPDATE leads
             SET lead_stage = :stage,
                 conversion_outcome = :outcome,
                 activity_status = :act_status,
                 modified_at = NOW()
             WHERE id = :id AND assigned_to = :emp"
        );
        $stmt->execute([
            ':stage'      => $leadStage,
            ':outcome'    => $outcome,
            ':act_status' => $activityStatus,
            ':id'         => $leadId,
            ':emp'        => $employeeCode
        ]);

        // Log stage progression in interactions so Admin sees it in employee-monitoring and lead-preview
        $logStmt = $pdo->prepare(
            "INSERT INTO interactions (
                lead_id, employee_code, interaction_type, notes,
                call_status, call_duration, call_record_url, resolution_status, interaction_date
             ) VALUES (
                :lead_id, :emp, 'Note', :notes,
                'N/A', '00:00', '', 'Completed', NOW()
             )"
        );
        $logStmt->execute([
            ':lead_id' => $leadId,
            ':emp'     => $employeeCode,
            ':notes'   => 'Pipeline stage updated to "' . $leadStage . '" by ' . $employeeCode . '.'
        ]);

        sendJson([
            'success'            => true,
            'message'            => 'Lead stage updated to ' . $leadStage . '.',
            'lead_id'            => $leadId,
            'lead_stage'         => $leadStage,
            'modified_formatted' => 'Just now'
        ]);
    }

    // 3. ADD NEW ACTIVITY / INTERACTION (From employee/manage-activity.html quick-add bar)
    if ($action === 'add_activity') {
        $leadId          = (int) ($reqData['lead_id'] ?? 0);
        $interactionType = trim((string) ($reqData['interaction_type'] ?? 'Note'));
        $notes           = trim((string) ($reqData['notes'] ?? ''));
        $resolution      = trim((string) ($reqData['resolution_status'] ?? 'Pending'));
        $callDuration    = trim((string) ($reqData['call_duration'] ?? '04:15'));

        if ($leadId <= 0 || $notes === '') {
            sendJson([
                'success' => false,
                'message' => 'Please select a lead and enter interaction notes.'
            ], 400);
        }

        $validTypes = ['Inbound Call', 'Outbound Call', 'Email Sent', 'Note'];
        if (!in_array($interactionType, $validTypes, true)) {
            $interactionType = 'Note';
        }

        $validResolutions = ['Scheduled', 'Pending', 'Completed', 'Cancelled'];
        if (!in_array($resolution, $validResolutions, true)) {
            $resolution = 'Pending';
        }

        $isCall    = in_array($interactionType, ['Inbound Call', 'Outbound Call'], true);
        $recordUrl = $isCall ? 'records/emp_call_' . $leadId . '_' . time() . '.mp3' : '';

        $insStmt = $pdo->prepare(
            "INSERT INTO interactions (
                lead_id, employee_code, interaction_type, notes,
                call_status, call_duration, call_record_url, resolution_status, interaction_date
             ) VALUES (
                :lead_id, :emp, :type, :notes,
                :call_status, :call_duration, :record_url, :resolution, NOW()
             )"
        );
        $insStmt->execute([
            ':lead_id'       => $leadId,
            ':emp'           => $employeeCode,
            ':type'          => $interactionType,
            ':notes'         => $notes,
            ':call_status'   => $isCall ? 'Completed' : 'N/A',
            ':call_duration' => $isCall ? $callDuration : '00:00',
            ':record_url'    => $recordUrl,
            ':resolution'    => $resolution
        ]);

        // Refresh lead modified_at timestamp
        $pdo->prepare("UPDATE leads SET modified_at = NOW(), activity_status = 'Active' WHERE id = :id")
            ->execute([':id' => $leadId]);

        sendJson([
            'success'                 => true,
            'message'                 => 'Activity logged and synchronized with Admin monitoring.',
            'activity_date_formatted' => 'Just now'
        ]);
    }

    // 4. UPDATE ACTIVITY RESOLUTION STATUS (From employee/manage-activity.html)
    if ($action === 'update_activity_resolution') {
        $interactionId = (int) ($reqData['interaction_id'] ?? 0);
        $resolution    = trim((string) ($reqData['resolution_status'] ?? ''));
        $validRes      = ['Scheduled', 'Pending', 'Completed', 'Cancelled'];

        if ($interactionId <= 0 || !in_array($resolution, $validRes, true)) {
            sendJson([
                'success' => false,
                'message' => 'Invalid interaction ID or resolution status.'
            ], 400);
        }

        // Refresh interaction_date when marked Completed
        $stmt = $pdo->prepare(
            "UPDATE interactions
             SET resolution_status = :res,
                 interaction_date = NOW()
             WHERE id = :id AND employee_code = :emp"
        );
        $stmt->execute([
            ':res' => $resolution,
            ':id'  => $interactionId,
            ':emp' => $employeeCode
        ]);

        // Also update parent lead modified_at
        $leadLookup = $pdo->prepare("SELECT lead_id FROM interactions WHERE id = :id");
        $leadLookup->execute([':id' => $interactionId]);
        $parentLeadId = (int) $leadLookup->fetchColumn();
        if ($parentLeadId > 0) {
            $pdo->prepare("UPDATE leads SET modified_at = NOW() WHERE id = :id")
                ->execute([':id' => $parentLeadId]);
        }

        sendJson([
            'success'                 => true,
            'message'                 => 'Resolution status updated to ' . $resolution . '.',
            'resolution_status'       => $resolution,
            'activity_date_formatted' => 'Just now'
        ]);
    }

    // 5. UPDATE TASK STATUS OR REMINDER (From employee/manage-task.html & smart-views.html)
    if ($action === 'update_task') {
        $taskId = (int) ($reqData['task_id'] ?? 0);
        if ($taskId <= 0) {
            sendJson(['success' => false, 'message' => 'Invalid task ID.'], 400);
        }

        // Handle reminder toggle if passed alone
        if (isset($reqData['reminder_active']) && !isset($reqData['status'])) {
            $rem = ((int) $reqData['reminder_active'] === 1) ? 1 : 0;
            $stmt = $pdo->prepare(
                "UPDATE tasks SET reminder_active = :rem WHERE id = :id AND assigned_to = :emp"
            );
            $stmt->execute([
                ':rem' => $rem,
                ':id'  => $taskId,
                ':emp' => $employeeCode
            ]);

            sendJson([
                'success'         => true,
                'message'         => 'Task reminder set to ' . ($rem ? 'On' : 'Off') . '.',
                'reminder_active' => $rem,
                'reminder_label'  => $rem ? 'On' : 'Off'
            ]);
        }

        $status = trim((string) ($reqData['status'] ?? ''));
        $validStatuses = ['Pending', 'Complete', 'Overdue'];
        if (!in_array($status, $validStatuses, true)) {
            sendJson(['success' => false, 'message' => 'Invalid task status.'], 400);
        }

        if ($status === 'Complete') {
            $stmt = $pdo->prepare(
                "UPDATE tasks
                 SET status = 'Complete',
                     reminder_active = 0,
                     completed_at = NOW()
                 WHERE id = :id AND assigned_to = :emp"
            );
            $stmt->execute([':id' => $taskId, ':emp' => $employeeCode]);

            // Touch parent lead modified_at
            $pdo->prepare(
                "UPDATE leads SET modified_at = NOW()
                 WHERE id = (SELECT lead_id FROM tasks WHERE id = :tid)"
            )->execute([':tid' => $taskId]);

            sendJson([
                'success'         => true,
                'message'         => 'Task completed. Overdue flag cleared and reminder turned Off.',
                'status'          => 'Complete',
                'is_overdue'      => false,
                'reminder_active' => 0,
                'reminder_label'  => 'Off'
            ]);
        } else {
            $stmt = $pdo->prepare(
                "UPDATE tasks
                 SET status = :status,
                     reminder_active = 1,
                     completed_at = NULL
                 WHERE id = :id AND assigned_to = :emp"
            );
            $stmt->execute([
                ':status' => $status,
                ':id'     => $taskId,
                ':emp'    => $employeeCode
            ]);

            sendJson([
                'success'         => true,
                'message'         => 'Task status updated to ' . $status . '.',
                'status'          => $status,
                'is_overdue'      => $status === 'Overdue',
                'reminder_active' => 1,
                'reminder_label'  => 'On'
            ]);
        }
    }
}

sendJson([
    'success' => false,
    'message' => 'Unrecognized Employee API action: ' . $action
], 400);