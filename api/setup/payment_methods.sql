CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` varchar(32) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `icon` varchar(255) DEFAULT NULL,
  `processor_config` json DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_enabled` (`enabled`),
  KEY `idx_type` (`type`),
  KEY `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default payment methods
INSERT INTO `payment_methods` (`id`, `name`, `type`, `enabled`, `icon`, `processor_config`, `is_default`) VALUES
('cash_default', 'Cash', 'cash', 1, 'payments', NULL, 1),
('credit_card_default', 'Credit Card', 'credit_card', 0, 'credit_card', '{"apiKey": null, "merchantId": null}', 0),
('debit_card_default', 'Debit Card', 'debit_card', 0, 'credit_card', '{"apiKey": null, "merchantId": null}', 0),
('mobile_payment_default', 'Mobile Payment', 'mobile_payment', 0, 'smartphone', '{"apiKey": null, "merchantId": null}', 0);

-- Add trigger to ensure only one default method
DELIMITER //
CREATE TRIGGER before_payment_method_insert
BEFORE INSERT ON payment_methods
FOR EACH ROW
BEGIN
    IF NEW.is_default = 1 THEN
        UPDATE payment_methods SET is_default = 0 WHERE id != NEW.id;
    END IF;
END//

CREATE TRIGGER before_payment_method_update
BEFORE UPDATE ON payment_methods
FOR EACH ROW
BEGIN
    IF NEW.is_default = 1 AND OLD.is_default = 0 THEN
        UPDATE payment_methods SET is_default = 0 WHERE id != NEW.id;
    END IF;
END//
DELIMITER ;
