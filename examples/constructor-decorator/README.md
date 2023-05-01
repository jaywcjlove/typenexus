Constructor Decorator Sample
===

```js
import { Controller, ContentType, Get, DSource, DataSource } from 'typenexus';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @ContentType('application/json')
  @Get()
  public async all(): Promise<User[]> {
    return this.dataSource.manager.find(User);
  }
}
```