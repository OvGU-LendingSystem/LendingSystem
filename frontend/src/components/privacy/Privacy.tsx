import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

//TODO
const GET_PRIVACY = gql`
    query GetPrivacy {
        getImprint
    }
`;

export function PrivacyScreen() {

    const {data: privacy, loading} = useQuery(GET_PRIVACY);
    
    if (!loading && privacy!=null){  
    
        return (
            <div style={{margin: '20px'}} dangerouslySetInnerHTML={{__html: privacy.getImprint}}></div>
        )
    }

    return <div>loading</div>
}