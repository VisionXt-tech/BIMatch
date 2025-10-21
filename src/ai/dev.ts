// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Flows will be imported for their side effects in this file.
import './flows/generateContractFlow';
