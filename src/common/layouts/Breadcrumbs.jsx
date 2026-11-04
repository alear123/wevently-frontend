import { Link, useLocation } from "react-router-dom";

function formatSegment(segment) {
    return segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(Boolean);
    const query = location.search; // preserva ?page=&search=&size=

    return (
        <nav style={{ fontSize: "16px", color: "#4a4a4a", margin: "10px 0" }}>
            <ol style={{ display: "flex", flexWrap: "wrap", listStyle: "none", padding: 0, margin: 0 }}>

                {pathnames.map((segment, index) => {
                    const base = "/" + pathnames.slice(0, index + 1).join("/");
                    const to = base + query; // añadimos query actual para mantener estado al volver
                    const isLast = index === pathnames.length - 1;
                    const label = formatSegment(segment);
                    if (pathnames.length > 1) {
                        return (
                            <li key={to} style={{ display: "flex", alignItems: "center" }}>
                                {!isLast ? (
                                    <>
                                        <Link to={to} style={{ textDecoration: "none", color: "#4a4a4a" }}>
                                            {label}
                                        </Link>
                                        <span style={{ margin: "0 6px" }}>{">"}</span>
                                    </>
                                ) : (
                                    <span style={{ fontWeight: 400 }}>{label}</span>
                                )}
                            </li>
                        );
                    }
                    else return null;
                })}

            </ol>
        </nav>
    );
}
