require("dotenv").config();
const OpenAI = require("openai");
const Prisma = require("../config/db.connect");
const { QUERY_SUCCESSFUL_MESSAGE } = require("../utils/response");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAssignTeamMember(req, res) {
  const { taskTitle, taskDescription } = req.body;
  try {
    const members = await Prisma.projectMember.findMany({
      include: {
        user: true,
      },
    });
    if (!members || members.length === 0) {
      return res.status(404).json({
        message: "No team members found",
      });
    }
    const memberStats = await Promise.all(
      members.map(async (member) => {
        const [completed, canceled] = await Promise.all([
          Prisma.task.count({
            where: {
              assigneeId: member.userId,
              status: "COMPLETED",
            },
          }),
          Prisma.task.count({
            where: {
              assigneeId: member.userId,
              status: "CANCELED",
            },
          }),
        ]);
        const fullName =
          `${member.user.firstName || ""} ${
            member.user.lastName || ""
          }`.trim() || member.user.username;
        return {
          fullName,
          heading: member.heading,
          completed,
          canceled,
          userId: member.userId,
        };
      })
    );
    const prompt = `
You're an AI assistant assigning tasks to the best team member.

Task Title: ${taskTitle}
Task Description: ${taskDescription}

Evaluate team members below based on their heading (expertise), number of completed tasks (good), and number of canceled tasks (bad). Recommend the best person for this task.

Team Members:
${memberStats
  .map(
    (m) =>
      `- ${m.fullName} | Heading: ${m.heading} | Completed: ${m.completed} | Canceled: ${m.canceled}`
  )
  .join("\n")}
Return ONLY the full name of the best match.
`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const suggestion = completion.choices[0].message.content?.trim();
    const matched = memberStats.find((m) =>
      suggestion?.toLowerCase().includes(m.fullName.toLowerCase())
    );
    res.json({
      message: QUERY_SUCCESSFUL_MESSAGE,
      suggestedAssignee: matched?.fullName,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getAssignTeamMember };
