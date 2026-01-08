import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { ProductService } from "./product.service";

@Injectable()
export class ProductGuard implements CanActivate {
    constructor(private readonly productService: ProductService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        const {productId} = request.params;
        const store = request.store;

        if (!productId) throw new BadRequestException("Product id is required");
        if (isNaN(+productId)) throw new BadRequestException("Product id must be a valid number");

        const product = this.productService.getProductByIdAndStoreId(+productId, +store.id);

        if (!product) throw new BadRequestException("This store doesn't have this product");

        request.product = product;

        return true;
    }
    
}