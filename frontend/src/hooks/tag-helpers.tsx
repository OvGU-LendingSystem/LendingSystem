import { gql } from "@apollo/client";
import { useMutationWithResponse, useSuspenseQueryWithResponseMapped } from "./response-helper";
import { NewTag, RemoteTag, Tag } from "../models/tag.model";
import { UpdateResult } from "./image-helpers";

const ADD_TAG_MUTATION = gql`
mutation AddTag($tag: String!) {
  createTag(name: $tag) {
    tag {
      tagId
    }
    ok
    infoText
    statusCode
  }
}
`;

type AddTagResponse = {
    ok: true;
    infoText: string;
    tag: {
        tagId: string
    };
} | {
    ok: false,
    infoText: string;
};

export interface AddTagVars {
    tag: string
}

export function useAddTagMutation() {
    return useMutationWithResponse<AddTagResponse, AddTagVars>(ADD_TAG_MUTATION, 'createTag', {
        refetchQueries: [ GET_TAGS_QUERY ]
    });
}

// -------------------------------------------------------------------------------------------------

export function useUpdateTags() {
    const [ addTagMutation ] = useAddTagMutation();

    const getTagsResult = async (tags: Tag[], setTags: (val: Tag[]) => void): Promise<UpdateResult> => {
        const addTagsResponse = tags.map(async (tag): Promise<{ success: true, tag: RemoteTag } | { success: false, tag: NewTag }> => {
            if ('id' in tag) {
                return Promise.resolve({ success: true, tag });
            }

            const result = await addTagMutation({ variables: { tag: tag.tag } });
            if (result.success) {
                return { success: true, tag: { id: result.tag.tagId, tag: tag.tag }  }
            }
            return { success: false, tag: tag };
        });

        const result = await Promise.all(addTagsResponse);
        setTags(result.map((res) => res.tag));
        
        if (result.some((res) => !res.success)) {
            return { success: false, error: undefined };
        }
        const tagIds = result.map((res) => {
            if (!res.success)
                throw new Error();
            return res.tag.id;
        });

        return { success: true, value: tagIds };
    }

    const update = async (tags: Tag[]): Promise<[ UpdateResult, () => Promise<UpdateResult> ]> => {
        let tagsResult: Tag[] = tags;

        return [ await getTagsResult(tagsResult, (tags) => tagsResult = tags), () => getTagsResult(tagsResult, (tags) => tagsResult = tags) ];
    };

    return update;
}

// -------------------------------------------------------------------------------------------------

const GET_TAGS_QUERY = gql`
query GetTags {
  filterTags {
    id: tagId
    tag: name
  }
}
`;

interface GetTagsResponse {
    id: string,
    tag: string
}

export function useGetTagsQuery() {
    const mapToTag = (val: GetTagsResponse[]) => {
        return val.map((tagResponse): RemoteTag => ({ id: tagResponse.id, tag: tagResponse.tag }));
    };

    return useSuspenseQueryWithResponseMapped<GetTagsResponse[], RemoteTag[]>(GET_TAGS_QUERY, 'filterTags', {}, mapToTag);
}