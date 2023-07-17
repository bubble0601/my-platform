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

const ProfilePage = async () => {
  const start = performance.now();
  const client = await getAuthedClient();
  console.log("getAuthedClient", performance.now() - start);
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
};

export default ProfilePage;
