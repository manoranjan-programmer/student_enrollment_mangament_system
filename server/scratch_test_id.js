const facultyModel = require("./models/facultyModel");

async function test() {
  try {
    const dept = "Artificial Intelligence and Data Science";
    const nextCode = await facultyModel.getNextFacultyCode(dept);
    console.log(`Next code for ${dept}:`, nextCode);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit();
  }
}

test();
