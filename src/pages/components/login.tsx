import { Button } from "@chakra-ui/button";

export default function Login() {
  return (
    <>
      <Button
        size={"lg"}
        colorScheme="blue"
        onClick={() => window.open("/api/auth/login", "_self")}
      >
        Login
      </Button>
    </>
  );
}

export { Login };
