export function composeProviders(providers: any) {
  return providers.reduce(
    (Prev: any, Curr: any) =>
      function Providers({ children }: any) {
        return (
          <Prev>
            <Curr>{children}</Curr>
          </Prev>
        );
      }
  );
}

export function capitalizeFirstLetter(s: string) {
  return s
    .split("_")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}

export function stripFileNameUuid(fileName: string) {
  return fileName.replace(/^[^.]*\./, "");
}
