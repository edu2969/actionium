export function getClientImageSrc(
    imagePath: string | null | undefined
): string {
    const trimmedPath = imagePath?.trim().replace(/\\/g, "/");
    if (!trimmedPath || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(trimmedPath)) {
        return "";
    }

    const publicPath = trimmedPath
        .replace(/^(?:\.\/)+/, "")
        .replace(/^\/+/, "")
        .replace(/^public\//i, "");
    const pathSegments = publicPath.split("/");

    if (
        !publicPath ||
        pathSegments.some(
            (segment) => !segment || segment === "." || segment === ".."
        )
    ) {
        return "";
    }

    return `/${publicPath}`;
}
