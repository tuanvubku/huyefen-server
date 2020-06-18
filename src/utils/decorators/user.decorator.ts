import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator( (data,req) => {
  return req.args[0].user;
});