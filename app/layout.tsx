export const metadata = {
  title: "Scene Gourmet",
  description: "シーンを伝えるだけ。AIが最適な一軒を選ぶ。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
