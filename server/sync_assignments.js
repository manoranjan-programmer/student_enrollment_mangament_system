const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:Manoranjan@127.0.0.1:5432/student'
});

async function run() {
    try {
        console.log('Refining instructional load for AD Faculty 1...');
        
        // 1. Keep only courses with enrollments for AD Faculty 1 (ID 2)
        // Based on analysis, keeping: AD04-04, AD04-05, U21AD406
        await pool.query(`
            UPDATE courses 
            SET faculty_id = 3 
            WHERE department = 'Artificial Intelligence and Data Science' 
              AND code NOT IN ('AD04-04', 'AD04-05', 'U21AD406')
        `);
        
        console.log('Refinement complete. Only active subjects remain assigned.');
    } catch (err) {
        console.error('Error during refinement:', err);
    } finally {
        await pool.end();
    }
}

run();
