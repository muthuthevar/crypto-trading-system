import pool from "../config/db";

export interface Balance {
  Id?: number;
  user_id: number;
  currency_symbol: string;
  balance: number;
}

export async function getBalance(
  userId: number,
  currencySymbol: string
): Promise<Balance | null> {
  const [rows] = await pool.execute(
    "SELECT * FROM Balances WHERE user_id = ? AND currency_symbol = ?",
    [userId, currencySymbol]
  );

  const balanceRows = rows as Balance[];
  return balanceRows.length > 0 ? balanceRows[0] : null;
}

export async function updateBalance(
  userId: number,
  currencySymbol: string,
  amount: number
): Promise<boolean> {
  const balance = await getBalance(userId, currencySymbol);

  if (balance) {
    // Update existing balance
    const [result] = await pool.execute(
      "UPDATE Balances SET balance = ? WHERE user_id = ? AND currency_symbol = ?",
      [amount, userId, currencySymbol]
    );

    return (result as any).affectedRows > 0;
  } else {
    // Insert new balance
    const [result] = await pool.execute(
      "INSERT INTO Balances (user_id, currency_symbol, balance) VALUES (?, ?, ?)",
      [userId, currencySymbol, amount]
    );

    return (result as any).insertId > 0;
  }
}
