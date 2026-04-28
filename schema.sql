CREATE TABLE IF NOT EXISTS banks (
  bank_id INTEGER PRIMARY KEY,
  bank_name TEXT NOT NULL,
  bank_icon_url TEXT
);

CREATE TABLE IF NOT EXISTS credit_cards (
  card_id INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_id INTEGER NOT NULL,
  card_name TEXT NOT NULL,
  card_number TEXT,
  billing_day INTEGER NOT NULL,
  is_next_period INTEGER NOT NULL DEFAULT 0,
  grace_type TEXT,
  grace_days INTEGER,
  repayment_day INTEGER,
  repaid INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (bank_id) REFERENCES banks(bank_id)
);
