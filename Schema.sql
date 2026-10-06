-- ============================================================
-- Lost & Found — Flea Market Batangas
-- Database schema + seed data
-- Import this in phpMyAdmin (XAMPP) BEFORE anything else.
--
-- If you already imported an earlier version of this schema,
-- just run this one line instead of re-importing everything:
--   ALTER TABLE products ADD COLUMN original_price VARCHAR(50) NULL AFTER price;
-- ============================================================

CREATE DATABASE IF NOT EXISTS lostfound CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lostfound;

-- ---------- BRANDS ----------
CREATE TABLE brands (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  tag VARCHAR(50),
  description TEXT,
  img TEXT,
  color VARCHAR(20),
  location VARCHAR(150),
  year VARCHAR(10),
  schedule VARCHAR(150),
  instagram VARCHAR(100),
  follows INT DEFAULT 0,
  password VARCHAR(255) NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- PRODUCTS ----------
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  tag VARCHAR(100),
  price VARCHAR(50) NOT NULL,
  original_price VARCHAR(50) NULL,
  size VARCHAR(100),
  img TEXT,
  imgs JSON,
  is_new TINYINT(1) DEFAULT 0,
  stock INT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- ORDERS ----------
CREATE TABLE orders (
  id VARCHAR(30) PRIMARY KEY,
  customer_name VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,
  pay_method VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  tracking_number VARCHAR(50),
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  date_placed VARCHAR(50),
  timeline JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(30) NOT NULL,
  product_id INT,
  brand_id VARCHAR(50),
  name VARCHAR(200),
  price VARCHAR(50),
  qty INT DEFAULT 1,
  size VARCHAR(100),
  img TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(30) NOT NULL,
  role ENUM('merchant','customer') NOT NULL,
  text TEXT,
  time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- REVIEWS ----------
CREATE TABLE reviews (
  id VARCHAR(30) PRIMARY KEY,
  product_id INT NOT NULL,
  author VARCHAR(150),
  rating INT,
  text TEXT,
  img TEXT,
  date VARCHAR(50),
  merchant_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- TESTIMONIALS ----------
CREATE TABLE testimonials (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(150),
  location VARCHAR(150),
  rating INT,
  text TEXT,
  avatar VARCHAR(10),
  approved TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE testimonial_requests (
  id VARCHAR(30) PRIMARY KEY,
  brand_id VARCHAR(50),
  brand_name VARCHAR(150),
  name VARCHAR(150),
  location VARCHAR(150),
  rating INT,
  text TEXT,
  avatar VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at VARCHAR(50)
) ENGINE=InnoDB;

-- ---------- NOTIFICATIONS ----------
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  audience ENUM('customer','merchant') NOT NULL,
  merchant_id VARCHAR(50) NULL,
  icon TEXT,
  text TEXT,
  target VARCHAR(50) NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- PENDING IMAGE APPROVALS ----------
CREATE TABLE pending_images (
  id VARCHAR(30) PRIMARY KEY,
  merchant_id VARCHAR(50),
  merchant_name VARCHAR(150),
  type VARCHAR(30),
  image_data LONGTEXT,
  target_index INT NULL,
  label VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at VARCHAR(50)
) ENGINE=InnoDB;

-- ---------- EVENTS ----------
CREATE TABLE events (
  id VARCHAR(30) PRIMARY KEY,
  brand_id VARCHAR(50),
  title VARCHAR(200),
  event_date DATE,
  event_time VARCHAR(50),
  location VARCHAR(200),
  description TEXT,
  img TEXT,
  posted_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE event_interests (
  event_id VARCHAR(30) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  PRIMARY KEY (event_id, session_id)
) ENGINE=InnoDB;

-- ---------- FEEDBACK ----------
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  type VARCHAR(30),
  msg TEXT,
  time VARCHAR(50)
) ENGINE=InnoDB;

-- ---------- SITE SETTINGS (hero/mascot/logo/carousel/banners + admin login) ----------
CREATE TABLE site_settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value LONGTEXT
) ENGINE=InnoDB;

-- No admin account is seeded. Run backend/setup.php once to create
-- your own admin username and password (stored as a bcrypt hash).


-- ============================================================
-- SEED DATA — matches the DEFAULT_BRANDS / DEFAULT_PRODUCTS
-- currently hard-coded in lostandfound.js, so the live site
-- looks identical on day one. Merchant passwords are NOT seeded:
-- backend/setup.php gives each merchant a random temporary password
-- that must be changed on first login.
-- ============================================================

INSERT INTO brands (id,name,tag,description,img,color,location,year,schedule,instagram,follows,password) VALUES
('lostandfound','Lost & Found','admin','Lost & Found system administrator. Full access to all merchants, products, orders, and settings.','brand pics/logolostandfound.jpg','#0c0b09','Batangas','','', '', 0,NULL),
('geckoman','Geckoman','hat','Quality caps and headwear for every style. Hats only — snapbacks, buckets, truckers & more.','brand pics/gecko.jpg','#1a0a00','Batangas','2021','Every Saturday, 8AM–5PM','@geckoman_ph',142,NULL),
('hooksnloops','Hooks n Loops','crochet','Crochet items and so much more! Bags, accessories, stuffed toys & handmade creations by Batangas locals.','brand pics/Hooks  Loops.jpg','#0a1a0a','Batangas','2022','Weekends','@hooksnloops',98,NULL),
('outhrift','Outhrift','thrift','Curated vintage tees, hoodies, and streetwear at affordable prices. Hand-picked thrift finds — tshirts, hoodies, jackets & more.','brand pics/outhrift.jpg','#001a0a','Batangas','2020','Every Weekend, 9AM–6PM','@outhrift',318,NULL),
('10thrift','10 Thrift','thrift','Affordable thrift finds, hand-picked weekly from local bazaars and ukay-ukay. Tops, bottoms, outerwear & more.','brand pics/10thrift.jpg','#0a0a1a','Batangas','2020','Every Saturday','@10thrift',187,NULL),
('chasingscents','Chasing Scents','perfume','Premium perfumes and niche fragrances. Wide selection of EDP, EDT, and body mists at great prices.','brand pics/chasingscents.jpg','#1a001a','Batangas','2022','Weekends, 10AM–5PM','@chasingscentsph',256,NULL),
('beadsunstoppable','Beads Unstoppable','thrift','Beads Unstoppable — quality thrift pieces at unbeatable prices. Tops, bottoms, outerwear & more.','brand pics/greatdilemma.jpg','#1a1a00','Batangas','2022','Sundays, 8AM–4PM','@beadsunstoppable',98,NULL),
('zero4thrift','Zero4Thrift','thrift','Fresh thrift drops every week. Tops, bottoms, outerwear & more at zero-budget prices.','brand pics/zero4thrift.jpg','#0a0010','Batangas','2021','Weekends','@zero4thrift',134,NULL),
('kriztianothrift','Kriztiano Thrift','thrift','Kriztiano Thrift — your go-to for affordable pre-loved fashion finds in Batangas.','brand pics/kriztianothrift.jpg','#1a0800','Batangas','2023','Every Weekend','@kriztianothrift',77,NULL),
('perfumesbatangas','Arranged by Annita','aniknik','Arranged by Annita — beautiful handcrafted bouquets and floral arrangements for every occasion.','brand pics/Perfumes Batangas by Arashi.jpg','#1a000a','Batangas','2022','Weekends','@arrangedbyannita',201,NULL),
('selahessentials','Selah Essentials','perfume','Carefully curated essential perfumes and scents. Calm your senses with Selah.','brand pics/Selah Essentials.jpg','#001010','Batangas','2023','Weekends','@selahessentials',88,NULL),
('thriftthread','Thrift Thread','thrift','Thrift Thread — curated pre-loved fashion finds for the budget-conscious fashionista in Batangas.','brand pics/Fivis Thrift.jpg','#0a1000','Batangas','2021','Every Weekend','@thriftthread',145,NULL),
('soltheminishop','Sol The Mini Shop','aniknik','Your neighborhood anik-anik shop! Collectibles, cute finds, accessories, novelty items & lifestyle products.','brand pics/soltheminishop.jpg','#10001a','Batangas','2023','Weekends','@soltheminishop',109,NULL),
('daveskybiker','Daveskybiker 3D Printing','3dprint','3D printing services for students, schools, creators & local businesses. Powered by Bambu Lab P2S, A1 & Elegoo Centauri Carbon.','brand pics/Daveskybiker 3D Printing.jpg','#001020','Batangas','2022','Order anytime, pickup on market days','@daveskybiker',77,NULL);

INSERT INTO products (id,brand_id,name,tag,price,original_price,size,img,imgs,is_new,stock,views) VALUES
(1,'geckoman','Bass Pro','Hat','699',NULL,'56-58cm','products for gecko/BASS PRO.jfif',JSON_ARRAY('products for gecko/BASS PRO.jfif'),1,15,142),
(2,'geckoman','Dont Trip','Hat','645',NULL,'57-59cm','products for gecko/DONT PIRT.jfif',JSON_ARRAY('products for gecko/DONT PIRT.jfif'),1,8,98),
(3,'geckoman','Supreme','Hat','795',NULL,'Adjustable','products for gecko/SUPREME.jfif',JSON_ARRAY('products for gecko/SUPREME.jfif'),0,14,76),
(4,'geckoman','Wake N Bake','Hat','695',NULL,'Adjustable','products for gecko/WAKE  N BAKE.jfif',JSON_ARRAY('products for gecko/WAKE  N BAKE.jfif'),1,6,55),
(5,'hooksnloops','Mera Mera no Mi','KeyChain','480',NULL,'12cm','products for hooks/in-love-with-a-boy-so-i-crocheted-him-a-mera-mera-no-mi-v0-ags6ibjlvgug1-removebg-preview.png',JSON_ARRAY('products for hooks/in-love-with-a-boy-so-i-crocheted-him-a-mera-mera-no-mi-v0-ags6ibjlvgug1-removebg-preview.png'),1,7,88),
(6,'hooksnloops','Baby Totoro','KeyChain','320',NULL,'Adjustable','products for hooks/Baby_Totoro_Keychains-removebg-preview.png',JSON_ARRAY('products for hooks/Baby_Totoro_Keychains-removebg-preview.png'),1,5,72),
(7,'hooksnloops','Mr Bean Teddy','Toy','250',NULL,'10cm','products for hooks/Mr._Bean_Teddy_handmade_crochet_keychain-removebg-preview.png',JSON_ARRAY('products for hooks/Mr._Bean_Teddy_handmade_crochet_keychain-removebg-preview.png'),0,12,44),
(8,'outhrift','Vintage Tee — Washed','Top','350','450','L','https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=500'),1,5,203),
(9,'outhrift','Oversized Hoodie','Top','650',NULL,'XL','https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=500'),0,12,87),
(10,'outhrift','Graphic Band Tee','Top','280',NULL,'M','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=500'),1,2,158),
(11,'10thrift','Denim Jacket Raw','Outerwear','780',NULL,'M','products for 10thrift/acme.jpg',JSON_ARRAY('products for 10thrift/acme.jpg'),0,6,134),
(12,'10thrift','Y2K Cargo Pants','Bottoms','520',NULL,'32','products for 10thrift/loewe.jpg',JSON_ARRAY('products for 10thrift/loewe.jpg'),1,9,175),
(13,'10thrift','Windbreaker Jacket','Outerwear','920',NULL,'L','products for 10thrift/harley.jpg',JSON_ARRAY('products for 10thrift/harley.jpg'),1,3,143),
(14,'chasingscents','Midnight Bloom EDP','Perfume','850',NULL,'30ml','https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500'),1,20,310),
(15,'chasingscents','Cedar & Oud','Perfume','1200',NULL,'50ml','https://images.unsplash.com/photo-1588776814546-1ffbb74cc0b7?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1588776814546-1ffbb74cc0b7?q=80&w=500'),0,7,188),
(17,'beadsunstoppable','necklace','Top','480',NULL,'M','products for beads unstoppable/6390f4de-243e-4c03-b7ab-74af4318c9b0.jfif',JSON_ARRAY('products for beads unstoppable/6390f4de-243e-4c03-b7ab-74af4318c9b0.jfif'),0,11,92),
(34,'beadsunstoppable','bracelet','Bottoms','580',NULL,'30','products for beads unstoppable/necklace.jfif',JSON_ARRAY('products for beads unstoppable/necklace.jfif'),1,5,112),
(18,'zero4thrift','Washed Polo Shirt','Top','220',NULL,'L','products for zero4thrift/cahmps.jpg',JSON_ARRAY('products for zero4thrift/cahmps.jpg'),1,8,66),
(19,'zero4thrift','Vintage Crewneck','Top','350',NULL,'M','products for zero4thrift/vntg.jpg',JSON_ARRAY('products for zero4thrift/vntg.jpg'),0,4,54),
(20,'kriztianothrift','Balenciaga Polo','Top','380',NULL,'M/L','products for kriztiano/balen.jfif',JSON_ARRAY('products for kriztiano/balen.jfif'),1,6,89),
(21,'kriztianothrift','Vintage Graphic Hoodie','Top','490',NULL,'L','products for kriztiano/vntg wres.jfif',JSON_ARRAY('products for kriztiano/vntg wres.jfif'),0,4,67),
(22,'perfumesbatangas','Classic Rose Bouquet','Bouquet','750',NULL,'Medium','https://images.unsplash.com/photo-1487530811015-780780d13b82?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1487530811015-780780d13b82?q=80&w=500'),1,15,231),
(23,'perfumesbatangas','Sunflower Arrangement','Bouquet','450',NULL,'Small','https://images.unsplash.com/photo-1490750967868-88df5691cc4a?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1490750967868-88df5691cc4a?q=80&w=500'),0,18,144),
(24,'selahessentials','Selah Rose & Musk','Perfume','580',NULL,'50ml','https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=500'),1,12,88),
(25,'selahessentials','Selah Amber Collection','Perfume','650',NULL,'30ml','https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500',JSON_ARRAY('https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=500'),0,9,71),
(26,'thriftthread','Vintage Oversized Jacket','Outerwear','620',NULL,'L','products for thrift thread/ae104824-0b70-468c-a40a-2e3b7d60e493.jfif',JSON_ARRAY('products for thrift thread/ae104824-0b70-468c-a40a-2e3b7d60e493.jfif'),1,4,101),
(27,'thriftthread','Thrift Graphic Tee','Top','260',NULL,'M','products for thrift thread/stuss.jfif',JSON_ARRAY('products for thrift thread/stuss.jfif'),0,8,74),
(28,'soltheminishop','Enamel Pin Collection','Anik-anik','120',NULL,'One size','https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'),1,30,177),
(29,'soltheminishop','Mini Keychain Set','Anik-anik','95',NULL,'One size','https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'),0,25,88),
(30,'soltheminishop','Novelty Sticker Pack','Anik-anik','75',NULL,'One size','https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600'),1,40,112),
(31,'daveskybiker','Custom 3D Print (Small)','3D Print','150',NULL,'Custom','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600'),1,99,143),
(32,'daveskybiker','Engineering Part Prototype','3D Print','350',NULL,'Custom','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600'),0,99,88),
(33,'daveskybiker','Custom 3D Print (Large)','3D Print','650','850','Custom','https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600',JSON_ARRAY('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600'),1,99,65);

-- keep future auto-inserted products from colliding with the seeded IDs above
ALTER TABLE products AUTO_INCREMENT = 100;

INSERT INTO testimonials (id,name,location,rating,text,avatar,approved) VALUES
('t1','Mika Santos','Lipa, Batangas',5,'Got a gorgeous vintage tee from Outhrift — came super fast and quality was amazing! Will definitely order again.','MS',1),
('t2','Jake Reyes','Batangas City',5,'The snapback from Geckoman fits perfectly. Best cap I''ve bought! Great quality and fast shipping.','JR',1),
('t3','Camille Cruz','Tanauan',4,'Chasing Scents has the best selections. Midnight Bloom is now my everyday scent!','CC',1),
('t4','Renz Villanueva','Nasugbu',5,'Sol The Mini Shop has the cutest anik-anik finds! Got a whole set of enamel pins. Supporting local Batangas brands has never been this easy!','RV',1);