import Contact from "../models/Contact.js";

export async function submitContact(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Sva polja su obavezna." });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Ime mora imati bar 2 karaktera." });
    }

    if (subject.trim().length < 3) {
      return res.status(400).json({ message: "Naslov mora imati bar 3 karaktera." });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ message: "Poruka mora imati bar 10 karaktera." });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      message: "Poruka je uspešno poslata.",
      contact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}