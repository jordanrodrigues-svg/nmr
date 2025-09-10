import { useEffect, useState } from 'react';

interface Molecule {
  id: number;
  x: number;
  y: number;
  rotation: number;
  size: number;
  type: 'water' | 'co2' | 'methane' | 'benzene';
  speed: number;
}

export function ChemistryBackground() {
  const [molecules, setMolecules] = useState<Molecule[]>([]);

  useEffect(() => {
    // Create initial molecules
    const initialMolecules: Molecule[] = [];
    for (let i = 0; i < 12; i++) {
      initialMolecules.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        size: 0.5 + Math.random() * 0.8,
        type: ['water', 'co2', 'methane', 'benzene'][Math.floor(Math.random() * 4)] as any,
        speed: 0.1 + Math.random() * 0.3,
      });
    }
    setMolecules(initialMolecules);

    // Animate molecules
    const interval = setInterval(() => {
      setMolecules(prev => prev.map(mol => ({
        ...mol,
        rotation: mol.rotation + mol.speed,
        y: mol.y > 105 ? -5 : mol.y + mol.speed * 0.1,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const renderMolecule = (molecule: Molecule) => {
    const baseSize = 40 * molecule.size;
    
    switch (molecule.type) {
      case 'water':
        return (
          <g>
            <circle cx="0" cy="-8" r="6" fill="hsl(var(--chart-1))" opacity="0.6" />
            <circle cx="-6" cy="4" r="4" fill="hsl(var(--chart-2))" opacity="0.6" />
            <circle cx="6" cy="4" r="4" fill="hsl(var(--chart-2))" opacity="0.6" />
            <line x1="0" y1="-2" x2="-6" y2="4" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
            <line x1="0" y1="-2" x2="6" y2="4" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
          </g>
        );
      case 'co2':
        return (
          <g>
            <circle cx="-10" cy="0" r="5" fill="hsl(var(--chart-3))" opacity="0.6" />
            <circle cx="0" cy="0" r="4" fill="hsl(var(--chart-1))" opacity="0.7" />
            <circle cx="10" cy="0" r="5" fill="hsl(var(--chart-3))" opacity="0.6" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.4" />
          </g>
        );
      case 'benzene':
        return (
          <g>
            {[0, 1, 2, 3, 4, 5].map(i => {
              const angle = (i * 60) * Math.PI / 180;
              const x = Math.cos(angle) * 8;
              const y = Math.sin(angle) * 8;
              return (
                <circle key={i} cx={x} cy={y} r="3" fill="hsl(var(--chart-1))" opacity="0.6" />
              );
            })}
            {[0, 1, 2, 3, 4, 5].map(i => {
              const angle1 = (i * 60) * Math.PI / 180;
              const angle2 = ((i + 1) % 6 * 60) * Math.PI / 180;
              const x1 = Math.cos(angle1) * 8;
              const y1 = Math.sin(angle1) * 8;
              const x2 = Math.cos(angle2) * 8;
              const y2 = Math.sin(angle2) * 8;
              return (
                <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" />
              );
            })}
          </g>
        );
      default:
        return (
          <g>
            <circle cx="0" cy="0" r="5" fill="hsl(var(--chart-2))" opacity="0.6" />
            <circle cx="-8" cy="-6" r="3" fill="hsl(var(--chart-3))" opacity="0.5" />
            <circle cx="8" cy="-6" r="3" fill="hsl(var(--chart-3))" opacity="0.5" />
            <circle cx="0" cy="8" r="3" fill="hsl(var(--chart-3))" opacity="0.5" />
            <line x1="0" y1="0" x2="-8" y2="-6" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" />
            <line x1="0" y1="0" x2="8" y2="-6" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="hsl(var(--muted-foreground))" strokeWidth="1" opacity="0.3" />
          </g>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {molecules.map(molecule => (
          <g
            key={molecule.id}
            transform={`translate(${molecule.x}, ${molecule.y}) rotate(${molecule.rotation}) scale(${molecule.size})`}
            className="opacity-20"
          >
            {renderMolecule(molecule)}
          </g>
        ))}
      </svg>
      
      {/* Periodic table elements scattered in background */}
      <div className="absolute inset-0">
        {['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg'].map((element, i) => (
          <div
            key={element}
            className="absolute w-12 h-12 bg-primary/5 border border-primary/10 rounded-sm flex items-center justify-center text-xs font-mono text-primary/30 animate-pulse"
            style={{
              left: `${5 + (i * 7) % 85}%`,
              top: `${10 + (i * 13) % 80}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + i * 0.1}s`
            }}
          >
            {element}
          </div>
        ))}
      </div>
    </div>
  );
}