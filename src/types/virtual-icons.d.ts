declare module "virtual:site-icons" {
  const icons: Record<
    string,
    { url: string; width: number; height: number; left?: number; top?: number }
  >;
  export default icons;
}
