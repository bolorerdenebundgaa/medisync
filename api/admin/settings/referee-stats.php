<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/Database.php';
include_once '../../models/Settings.php';
include_once '../../middleware/AdminAuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

// Verify user is authenticated
$auth = new AdminAuthMiddleware($database);
$user = $auth->authenticate();
if(!$user) {
    exit;
}

// Get referee ID from query parameters
$refereeId = isset($_GET['referee_id']) ? $_GET['referee_id'] : null;

// If user is referee, only show their own stats
if($user['role'] === 'referee') {
    $refereeId = $user['id'];
}

// If user is not admin and not viewing their own stats, deny access
if($user['role'] !== 'admin' && $refereeId !== $user['id']) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Access denied. You can only view your own statistics."
    ]);
    exit;
}

if(!$refereeId) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Referee ID is required"
    ]);
    exit;
}

try {
    $db->beginTransaction();

    // Get current settings for commission rate
    $settingsModel = new Settings($db);
    $settings = $settingsModel->get();
    
    // Get referee statistics
    $query = "SELECT 
                COUNT(DISTINCT s.id) as total_sales,
                SUM(s.total_amount) as total_sales_amount,
                SUM(re.amount) as total_commission,
                COUNT(DISTINCT p.id) as total_prescriptions,
                COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as completed_prescriptions,
                COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_prescriptions,
                COUNT(DISTINCT c.id) as total_clients,
                (SELECT SUM(amount) 
                 FROM referee_earnings 
                 WHERE referee_id = :referee_id1 AND status = 'pending') as pending_commission,
                (SELECT SUM(amount) 
                 FROM referee_earnings 
                 WHERE referee_id = :referee_id2 AND status = 'paid') as paid_commission
            FROM users u
            LEFT JOIN prescriptions p ON u.id = p.referee_id
            LEFT JOIN sales s ON p.id = s.prescription_id
            LEFT JOIN referee_earnings re ON s.id = re.sale_id
            LEFT JOIN clients c ON p.client_id = c.id
            WHERE u.id = :referee_id3
            GROUP BY u.id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":referee_id1", $refereeId);
    $stmt->bindParam(":referee_id2", $refereeId);
    $stmt->bindParam(":referee_id3", $refereeId);
    $stmt->execute();

    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Calculate additional metrics
    $stats['conversion_rate'] = $stats['total_prescriptions'] > 0 
        ? ($stats['completed_prescriptions'] / $stats['total_prescriptions']) * 100 
        : 0;

    $stats['average_commission'] = $stats['total_sales'] > 0 
        ? $stats['total_commission'] / $stats['total_sales'] 
        : 0;

    $stats['current_commission_rate'] = $settings['referee_commission_percentage'];

    // Get monthly trends (last 6 months)
    $query = "SELECT 
                DATE_FORMAT(s.created_at, '%Y-%m') as month,
                COUNT(DISTINCT s.id) as sales_count,
                SUM(s.total_amount) as sales_amount,
                SUM(re.amount) as commission_amount
            FROM sales s
            JOIN referee_earnings re ON s.id = re.sale_id
            WHERE re.referee_id = :referee_id
            AND s.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(s.created_at, '%Y-%m')
            ORDER BY month DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":referee_id", $refereeId);
    $stmt->execute();

    $stats['monthly_trends'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $db->commit();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $stats
    ]);

} catch(Exception $e) {
    $db->rollBack();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
