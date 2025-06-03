export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyQ51iuEfmlY2jptmI-I5jkAnEWCQyH9n5VoRfvkRUp-OZkgiufzeP5moHtqtJNFV92A/exec";

  try {
    const googleResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const result = await googleResponse.text();
    return res.status(200).json({ message: "Success", result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to forward", error: error.message });
  }
}
