import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLList as List,
  GraphQLNonNull as NonNull,
} from 'graphql';

const GitHubItemType = new ObjectType({
  name: 'GitHubItem',
  fields: {
    id: { type: new NonNull(ID) },
    name: { type: new NonNull(StringType) },
    html_url: { type: new NonNull(StringType) },
    description: { type: StringType },
    tags: { type: new List(StringType) },
    // publishedDate: { type: new NonNull(StringType) },
  },
});

export default ProjectItemType;
