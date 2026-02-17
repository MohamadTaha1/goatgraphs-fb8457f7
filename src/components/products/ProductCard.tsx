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
    <Link to={`/product/${slug}`} className="group surface-link block rounded-2xl p-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No Image</div>
        )}
      </div>
      <div className="space-y-1 px-1 pb-1 pt-3">
        <div className="flex flex-wrap gap-1">
          {teamName && <Badge variant="secondary" className="text-[10px] font-medium">{teamName}</Badge>}
          {jerseyType && <Badge variant="outline" className="text-[10px] font-medium">{jerseyType}</Badge>}
          {seasonName && <Badge variant="outline" className="text-[10px] font-medium">{seasonName}</Badge>}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight transition-colors group-hover:text-primary">{title}</h3>
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
