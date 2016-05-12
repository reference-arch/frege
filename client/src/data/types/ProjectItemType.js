import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLList as List,
  GraphQLNonNull as NonNull,
} from 'graphql';

const ProjectItemType = new ObjectType({
  name: 'ProjectItem',
  fields: {
    id: { type: new NonNull(ID) },
    github_id: { type: new NonNull(ID) },
    name: { type: new NonNull(StringType) },
    html_url: { type: new NonNull(StringType) },
    description: { type: StringType },
    tags: { type: new List(StringType) },
  },
});

export default ProjectItemType;
