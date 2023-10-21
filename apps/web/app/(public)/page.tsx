import { LinkButton } from "~/_components/ui/link-button";

export default function Page() {
  return (
    <div className="flex gap-1 p-24">
      <LinkButton to="/signup" color="indigo">
        Signup
      </LinkButton>
      <LinkButton to="/login" color="indigo">
        Login
      </LinkButton>
      <LinkButton to="/profile" color="indigo">
        Profile
      </LinkButton>
    </div>
  );
}
