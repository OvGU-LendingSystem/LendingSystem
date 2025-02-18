import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

const GET_PRIVACY = gql`
    query {
        getImprint
    }
`;

export function PrivacyScreen() {
    const {data: privacy} = useQuery(GET_PRIVACY);
        
    return (
        <div dangerouslySetInnerHTML={privacy.getImprint}></div>
    )
}