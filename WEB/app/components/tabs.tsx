export default function Tabs( {element}:{element:{reportname:string,href:string}[]}) {
    return (
        <ul className="flex flex-wrap text-sm font-medium text-center text-body border-b border-default">
            {element.map((tab, index) => (
                <li key={index} className="me-2">
                    <a href={tab.href} className="inline-block p-4 rounded-t-base hover:text-heading hover:bg-neutral-secondary-soft">{tab.reportname}</a>
                </li>
            ))}
        </ul>
    );
}