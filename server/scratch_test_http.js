const axios = require("axios");

async function test() {
  try {
    const dept = encodeURIComponent("Artificial Intelligence and Data Science");
    const res = await axios.get(`http://localhost:5000/faculty/next-code/${dept}`);
    console.log("Response:", res.data);
  } catch (err) {
    console.error("HTTP Test failed:", err.response ? err.response.data : err.message);
  } finally {
    process.exit();
  }
}

test();
