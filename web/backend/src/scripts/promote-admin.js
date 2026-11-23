import 'dotenv/config';
import { pool } from '../db/pool.js';

const email=process.argv[2];
if(!email){console.error('Usage: node src/scripts/promote-admin.js user@example.com');process.exitCode=2;}
else {
  try {
    const result=await pool.query("UPDATE users SET role='ADMIN' WHERE lower(email)=lower($1) RETURNING username,email,role",[email]);
    if(!result.rowCount){console.error('User not found; register this account first.');process.exitCode=1;}
    else console.log(`Promoted ${result.rows[0].email} to ADMIN.`);
  }catch(error){console.error('Could not promote user:',error.message);process.exitCode=1;}
  finally{await pool.end();}
}
