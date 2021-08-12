import { CustomScalar, Scalar } from '@nestjs/graphql'
import { Kind } from 'graphql'
import { Maybe } from 'graphql/jsutils/Maybe'
import { ValueNode } from 'graphql/language/ast'

@Scalar('Date', (_type) => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type'

  parseValue(value: string): Date {
    return new Date(value) // value from the client
  }

  serialize(value: Date): string {
    return new Date(value).toISOString() // value sent to the client
  }

  parseLiteral(ast: ValueNode): Maybe<Date> {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value)
    }
    return null
  }
}
