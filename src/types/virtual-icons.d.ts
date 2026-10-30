declare module "virtual:site-icons" {
  const icons: Record<
    string,
    { url: string; width: number; height: number; left?: number; top?: number; image?: boolean }
  >;
  export default icons;
}
