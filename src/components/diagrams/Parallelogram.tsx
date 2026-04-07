export default function Parallelogram() {
  return (
    <svg viewBox="0 0 300 200" className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape */}
      <polygon
        points="80,40 250,40 220,160 50,160"
        fill="#dbeafe"
        stroke="#2563eb"
        strokeWidth="2.5"
      />
      {/* Parallel marks on AB and CD */}
      <line x1="155" y1="36" x2="165" y2="36" stroke="#2563eb" strokeWidth="2" />
      <line x1="155" y1="32" x2="165" y2="32" stroke="#2563eb" strokeWidth="2" />
      <line x1="125" y1="156" x2="135" y2="156" stroke="#2563eb" strokeWidth="2" />
      <line x1="125" y1="152" x2="135" y2="152" stroke="#2563eb" strokeWidth="2" />
      {/* Parallel marks on AD and BC */}
      <line x1="62" y1="96" x2="58" y2="104" stroke="#2563eb" strokeWidth="2" />
      <line x1="232" y1="96" x2="228" y2="104" stroke="#2563eb" strokeWidth="2" />
      {/* Labels */}
      <text x="75" y="28" fontSize="14" fontWeight="bold" fill="#1e40af">A</text>
      <text x="252" y="28" fontSize="14" fontWeight="bold" fill="#1e40af">B</text>
      <text x="222" y="178" fontSize="14" fontWeight="bold" fill="#1e40af">C</text>
      <text x="35" y="178" fontSize="14" fontWeight="bold" fill="#1e40af">D</text>
      {/* Properties text */}
      <text x="150" y="195" fontSize="11" fill="#64748b" textAnchor="middle">
        AB ∥ DC, AD ∥ BC | AB = DC, AD = BC
      </text>
    </svg>
  );
}
