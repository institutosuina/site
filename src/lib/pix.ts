export const PIX_KEY = "21766841000184";
export const PIX_KEY_FORMATTED = "21.766.841/0001-84";
const RECEIVER_NAME = "INSTITUTO SUINA";
const RECEIVER_CITY = "JACAREI";

const field = (id: string, value: string) =>
  `${id}${value.length.toString().padStart(2, "0")}${value}`;

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

/** Pix "copia e cola" estático (BR Code). Sem `amount`, o doador escolhe o valor. */
export const buildPixPayload = (amount?: number, reference?: string) => {
  const txid = reference?.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const payload =
    field("00", "01") +
    field("26", field("00", "br.gov.bcb.pix") + field("01", PIX_KEY)) +
    field("52", "0000") +
    field("53", "986") +
    (amount && amount > 0 ? field("54", amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", RECEIVER_NAME) +
    field("60", RECEIVER_CITY) +
    field("62", field("05", txid)) +
    "6304";
  return payload + crc16(payload);
};

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
