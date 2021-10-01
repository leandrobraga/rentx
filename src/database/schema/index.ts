import { appSchema } from '@nozbe/watermelondb';

import { userSchema } from './UserSchema';
import { carSchema } from './carSchema';

const schemas = appSchema({
  version: 2,
  tables: [
    userSchema,
    carSchema
  ]
});

export { schemas };
