import { UnsubscribeForm } from "./UnsubscribeForm";
import styles from "./unsubscribe.module.css";

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({
  searchParams
}: UnsubscribePageProps) {
  const { token = "" } = await searchParams;

  return (
    <main className={styles.page}>
      <UnsubscribeForm token={token} />
    </main>
  );
}
