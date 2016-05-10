import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLString as StringType,
  GraphQLNonNull as NonNull,
} from 'graphql';

const ProjectItemType = new ObjectType({
  name: 'ProjectItem',
  fields: {
    id: { type: new NonNull(ID) },
    name: { type: new NonNull(StringType) },
    html_url: { type: new NonNull(StringType) },
    description: { type: StringType },
    // publishedDate: { type: new NonNull(StringType) },
    // contentSnippet: { type: StringType },
  },
});

export default ProjectItemType;
