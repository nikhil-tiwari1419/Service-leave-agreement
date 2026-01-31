import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import { useTheme } from '../Context/Theme'
import Footer from '../Components/Footer';

function Home() {
  const { theme } = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);

  const CardList = [
    {
      title: "Cleanliness",
      img: "/garbage.png",
      color: "from-blue-400 to-blue-600",
      info: {
        before: [
          "Manual complaint handling",
          "No fixed cleaning timelines"
        ],
        after: [
          "Digital complaint registration",
          "Time-bound cleaning resolution"
        ]
      }
    },
    {
      title: "Electricity",
      img: "/electric.png",
      color: "from-purple-400 to-purple-600",
      info: {
        before: [
          "Delayed power issue reporting",
          "No accountability for outages"
        ],
        after: [
          "Online issue reporting",
          "Faster fault resolution"
        ]
      }
    },
    {
      title: "Street & Public Safety",
      img: "/sps.png",
      color: "from-pink-400 to-pink-600",
      info: {
        before: [
          "Slow response to health complaints",
          "No tracking of issue status"
        ],
        after: [
          "Priority-based complaint handling",
          "Real-time status updates"
        ]
      }
    },
    {
      title: "Road & Infrastructure",
      img: "/road.png",
      color: "from-green-400 to-green-600",
      info: {
        before: [
          "Road issues reported informally",
          "No repair timelines"
        ],
        after: [
          "Digital road issue reporting",
          "Faster and planned repairs"
        ]
      }
    },
    {
      title: "Water Issues",
      img: "/water.png",
      color: "from-yellow-400 to-yellow-600",
      info: {
        before: [
          "Water issues reported informally",
          "Delayed response to complaints"
        ],
        after: [
          "Digital water issue reporting",
          "Faster and well-planned water supply repairs"
        ]
      }
    },
    {
      title: "Drainage System",
      img: "/dranage.png",
      color: "from-yellow-400 to-yellow-600",
      info: {
        before: [
          "Water issues reported informally",
          "Delayed response to complaints"
        ],
        after: [
          "Digital water issue reporting",
          "Faster and well-planned water supply repairs"
        ]
      }
    },
  ];

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen ubuntu-regular flex flex-col ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-gray-900 text-white"
            : "bg-gradient-to-b from-gray-50 to-blue-50 text-black"
        }`}
      >
        <div className='flex-grow mx-auto max-w-7xl pt-20 px-4 sm:px-6 lg:px-8 pb-12'>
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Our Services
            </h1>
            <p className={`text-lg md:text-xl ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              Transforming public services with digital solutions
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {CardList.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                  theme === "dark" 
                    ? "bg-slate-800 shadow-lg hover:shadow-blue-500/20" 
                    : "bg-white shadow-md hover:shadow-xl"
                }`}
              >
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-br ${item.color} p-6 pb-20 relative`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm font-semibold">
                      #{(idx + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-white text-2xl font-bold">
                    {item.title}
                  </h3>
                </div>

                {/* Image Section - Actual Size */}
                <div className="-mt-16 px-6 mb-4 relative z-10">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-6 pb-6">
                  {/* Before Section */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        theme === "dark" ? "bg-red-400" : "bg-red-500"
                      }`}></div>
                      <h4 className={`text-sm font-bold uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Before
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {item.info.before.map((point, i) => (
                        <li 
                          key={i} 
                          className={`text-sm flex items-start ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <span className="mr-2 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Divider */}
                  <div className={`my-4 border-t ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}></div>

                  {/* After Section */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        theme === "dark" ? "bg-green-400" : "bg-green-500"
                      }`}></div>
                      <h4 className={`text-sm font-bold uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                        After
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {item.info.after.map((point, i) => (
                        <li 
                          key={i} 
                          className={`text-sm flex items-start ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <span className="mr-2 mt-1">✓</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`absolute inset-0 border-2 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                  hoveredCard === idx 
                    ? 'opacity-100 border-blue-500' 
                    : 'opacity-0 border-transparent'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
        
        <hr className={theme === "dark" ? "border-gray-700" : "border-gray-300"} />
        <Footer />
      </div>
    </>
  )
}

export default Home;