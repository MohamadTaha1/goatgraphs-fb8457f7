import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Props {
  slug: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  teamName?: string;
  jerseyType?: string;
  seasonName?: string;
}

export default function ProductCard({ slug, title, price, salePrice, image, teamName, jerseyType, seasonName }: Props) {
  return (
    <Link to={`/product/${slug}`} className="group block">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex gap-1 flex-wrap">
          {teamName && <Badge variant="secondary" className="text-[10px] font-medium">{teamName}</Badge>}
          {jerseyType && <Badge variant="outline" className="text-[10px] font-medium">{jerseyType}</Badge>}
          {seasonName && <Badge variant="outline" className="text-[10px] font-medium">{seasonName}</Badge>}
        </div>
        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2">
          {salePrice ? (
            <>
              <span className="font-bold text-sm">${Number(salePrice).toFixed(2)}</span>
              <span className="text-xs text-muted-foreground line-through">${Number(price).toFixed(2)}</span>
            </>
          ) : (
            <span className="font-bold text-sm">${Number(price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
