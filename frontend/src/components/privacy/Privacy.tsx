import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

//TODO
const GET_PRIVACY = gql`
    query GetPrivacy {
        getPrivacyPolicy
    }
`;

export function PrivacyScreen() {

    const {data: privacy, loading} = useQuery(GET_PRIVACY);
    
    if (!loading && privacy!=null){  
    
        return (
            <div style={{margin: '20px'}} dangerouslySetInnerHTML={{__html: privacy.getPrivacyPolicy}}></div>
        )
    }

    return <div>loading</div>
}