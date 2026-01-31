import React from "react";
import { useTheme } from "../Context/Theme";

function Issues() {
    const { theme } = useTheme();

    const IssueList = [
        {
            category: "Electrical Issues",
            issues: [
                { id: 1, title: "Power outage in entire building" },
                { id: 2, title: "Frequent voltage fluctuations" },
                { id: 3, title: "Street lights not working" },
                { id: 4, title: "Short circuit in wiring" },
                { id: 5, title: "Transformer overheating" },
            ],
        },
        {
            category: "Water Issues",
            issues: [
                { id: 6, title: "No water supply for hours" },
                { id: 7, title: "Low water pressure" },
                { id: 8, title: "Water leakage from pipeline" },
                { id: 9, title: "Dirty / contaminated water" },
                { id: 10, title: "Overflowing water tank" },
            ],
        },
        {
            category: "Garbage Issues",
            issues: [
                { id: 11, title: "Garbage not collected regularly" },
                { id: 12, title: "Overflowing dustbins" },
                { id: 13, title: "Bad smell near garbage area" },
                { id: 14, title: "Open dumping of waste" },
                { id: 15, title: "No segregation of dry and wet waste" },
            ],
        },
        {
            category: "Road Issues",
            issues: [
                { id: 16, title: "Potholes on main road" },
                { id: 17, title: "Road damaged due to rain" },
                { id: 18, title: "No street signs or markings" },
                { id: 19, title: "Broken speed breakers" },
                { id: 20, title: "Traffic congestion due to poor road condition" },
            ],
        },
        {
            category: "Street & Public Safety",
            issues: [
                { id: 21, title: "Broken street lights" },
                { id: 22, title: "Unsafe open manholes" },
                { id: 23, title: "Lack of CCTV cameras" },
                { id: 24, title: "Poor visibility at night" },
                { id: 25, title: "Stray animals causing accidents" },
            ],
        },
        {
            category: "Drainage & Sanitation",
            issues: [
                { id: 26, title: "Blocked drainage system" },
                { id: 27, title: "Water logging during rain" },
                { id: 28, title: "Open drains causing health issues" },
                { id: 29, title: "Sewage overflow on roads" },
                { id: 30, title: "Mosquito breeding due to stagnant water" },
            ],
        },
    ];

    return (
        <div
            className={`ubuntu-regular rounded p-6 transition-colors ${theme === "dark"
                ? "bg-gray-600 text-white"
                : "bg-neutral-100 text-black"
                }`}
        >
            <h1 className="sm:text-3xl text-lg font-bold mb-6">Reported Issues</h1>

            <div className="gap-6 no-scrollbar  pb-4 snap-x snap-mandatory overflow-auto flex ">
                {IssueList.map((item, index) => (
                    <div
                        key={item.category}
                        className={`min-w-[320px] max-w-[320px] shrink-0 snap-start rounded-lg p-4 shadow ${theme === "dark" ? "bg-gray-800" : "bg-blue-50"
                            }`}
                    >
                        {/* Category */}
                        <h2 className="text-xl font-semibold mb-3">
                            {index + 1}. {item.category}
                        </h2>

                        {/* Issues */}
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {item.issues.map(issue => (
                                <li key={issue.id}>
                                    {issue.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Issues;
