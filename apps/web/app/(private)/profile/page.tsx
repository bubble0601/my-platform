import { graphql } from "~/_gql";
import { getAuthedClient } from "~/_utils/server";

const getProfileDocument = graphql(`
  query GetProfile {
    me {
      id
      name
    }
  }
`);

export default async function ProfilePage() {
  const client = await getAuthedClient();
  const result = await client.query(getProfileDocument, {}).toPromise();

  if (result.error) {
    throw result.error;
  }

  if (result.data?.me == null) return null;

  return (
    <div>
      <h1>Profile</h1>
      <p>id: {result.data.me.id}</p>
      <p>name: {result.data.me.name}</p>
    </div>
  );
}
