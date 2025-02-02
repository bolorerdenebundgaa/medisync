-- Branches table
CREATE TABLE IF NOT EXISTS `branches` (
  `id` varchar(32) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branch Users table (for role-based branch access)
CREATE TABLE IF NOT EXISTS `branch_users` (
  `id` varchar(32) NOT NULL,
  `branch_id` varchar(32) NOT NULL,
  `user_id` varchar(32) NOT NULL,
  `role_id` varchar(32) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `assigned_by` varchar(32) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_user_role` (`branch_id`, `user_id`, `role_id`),
  KEY `idx_branch_id` (`branch_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_branch_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_branch_users_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_branch_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branch Inventory table
CREATE TABLE IF NOT EXISTS `branch_inventory` (
  `id` varchar(32) NOT NULL,
  `branch_id` varchar(32) NOT NULL,
  `product_id` varchar(32) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '0',
  `min_quantity` int(11) NOT NULL DEFAULT '0',
  `max_quantity` int(11) NOT NULL DEFAULT '0',
  `reorder_point` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_product` (`branch_id`, `product_id`),
  KEY `idx_branch_id` (`branch_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_quantity` (`quantity`),
  CONSTRAINT `fk_branch_inventory_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_branch_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branch Clients table
CREATE TABLE IF NOT EXISTS `branch_clients` (
  `id` varchar(32) NOT NULL,
  `branch_id` varchar(32) NOT NULL,
  `client_id` varchar(32) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_client` (`branch_id`, `client_id`),
  KEY `idx_branch_id` (`branch_id`),
  KEY `idx_client_id` (`client_id`),
  CONSTRAINT `fk_branch_clients_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_branch_clients_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branch Referees table
CREATE TABLE IF NOT EXISTS `branch_referees` (
  `id` varchar(32) NOT NULL,
  `branch_id` varchar(32) NOT NULL,
  `referee_id` varchar(32) NOT NULL,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_branch_referee` (`branch_id`, `referee_id`),
  KEY `idx_branch_id` (`branch_id`),
  KEY `idx_referee_id` (`referee_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_branch_referees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_branch_referees_referee` FOREIGN KEY (`referee_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Branch Inventory Transactions table
CREATE TABLE IF NOT EXISTS `branch_inventory_transactions` (
  `id` varchar(32) NOT NULL,
  `branch_id` varchar(32) NOT NULL,
  `product_id` varchar(32) NOT NULL,
  `transaction_type` enum('in','out','transfer','adjustment') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference_type` varchar(50) NOT NULL,
  `reference_id` varchar(32) NOT NULL,
  `notes` text,
  `created_by` varchar(32) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_branch_id` (`branch_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_reference` (`reference_type`, `reference_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_branch_inventory_transactions_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_branch_inventory_transactions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_branch_inventory_transactions_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Triggers to maintain inventory quantities
DELIMITER //

CREATE TRIGGER after_branch_inventory_transaction_insert
AFTER INSERT ON branch_inventory_transactions
FOR EACH ROW
BEGIN
    IF NEW.transaction_type = 'in' OR NEW.transaction_type = 'transfer' THEN
        UPDATE branch_inventory 
        SET quantity = quantity + NEW.quantity
        WHERE branch_id = NEW.branch_id AND product_id = NEW.product_id;
    ELSEIF NEW.transaction_type = 'out' THEN
        UPDATE branch_inventory 
        SET quantity = quantity - NEW.quantity
        WHERE branch_id = NEW.branch_id AND product_id = NEW.product_id;
    ELSEIF NEW.transaction_type = 'adjustment' THEN
        UPDATE branch_inventory 
        SET quantity = NEW.quantity
        WHERE branch_id = NEW.branch_id AND product_id = NEW.product_id;
    END IF;
END//

DELIMITER ;
