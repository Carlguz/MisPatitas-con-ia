// Redirige la home (/) a la página con diseño.
// Si prefieres /seller, cambia '/customer' por '/seller'.
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: { destination: "/customer", permanent: false },
  };
};

export default function Home() {
  return null;
}
