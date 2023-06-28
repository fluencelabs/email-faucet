import { useUser } from "@auth0/nextjs-auth0/client";

function AuthContainer(props: {
  beforeLogin: JSX.Element;
  afterLogin: JSX.Element;
}) {
  const { user } = useUser();

  return <>{!user ? props.beforeLogin : props.afterLogin}</>;
}

export { AuthContainer };
