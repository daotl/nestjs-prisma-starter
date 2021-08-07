import { Field, Int, ObjectType } from '@nestjs/graphql'
import { PageInfo } from './page-info.model'
import { Type } from '@nestjs/common'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export default function Paginated<TItem>(TItemClass: Type<TItem>) {
  @ObjectType(`${TItemClass.name}Edge`)
  abstract class EdgeType {
    @Field((_type) => String)
    cursor!: string

    @Field((_type) => TItemClass)
    node!: TItem
  }

  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field((_type) => [EdgeType], { nullable: true })
    edges!: EdgeType[]

    // @Field((type) => [TItemClass], { nullable: true })
    // nodes: Array<TItem>;

    @Field((_type) => PageInfo)
    pageInfo!: PageInfo

    @Field((_type) => Int)
    totalCount!: number
  }
  return PaginatedType
}
