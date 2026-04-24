const IntakeForm = require('../../models/IntakeForm.model');
const IntakeFormNotes = require('../../models/IntakeFormNotes.model');
// ✅ CREATE NOTE
exports.createNote = async (req, res) => {
    try {
        const { intakeFormId, description, title } = req.body;

        // check intake form exists
        const intake = await IntakeForm.findById(intakeFormId);
        if (!intake) {
            return res.status(404).json({ message: "Intake form not found" });
        }

        const note = await IntakeFormNotes.create({
            intakeFormId,
            description,
            title
        });

        return res.status(201).json({
            message: "Note created successfully",
            data: note
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ✅ GET ALL NOTES (optionally by intakeFormId)
exports.getNotes = async (req, res) => {
    try {
        const { intakeFormId } = req.query;

        const filter = intakeFormId ? { intakeFormId } : {};

        const notes = await IntakeFormNotes.find(filter)
            .populate('intakeFormId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: notes.length,
            data: notes
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ✅ GET SINGLE NOTE
exports.getSingleNote = async (req, res) => {
    try {
        const note = await IntakeFormNotes.findById(req.params.id)
            .populate('intakeFormId');

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json(note);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ✅ UPDATE NOTE
exports.updateNote = async (req, res) => {
    try {
        const { description, title } = req.body;
        const note = await IntakeFormNotes.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        let obj = {
            title: title ?? note.title,
            description: description ?? note.description,
        }
        const note1 = await IntakeFormNotes.findByIdAndUpdate({ _id: note._id }, { $set: obj }, { new: true });
        if (note1) {
            return res.status(200).json({ message: "Note updated successfully", data: note });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// ✅ DELETE NOTE
exports.deleteNote = async (req, res) => {
    try {
        const note = await IntakeFormNotes.findByIdAndDelete(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};