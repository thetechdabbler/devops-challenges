# Challenge — Modules

## Scenario

Your team has extracted a reusable VPC module into `modules/vpc/`. A colleague started writing the module and the root module calling it, but the module is missing required input variables, outputs aren't exposed correctly, and the module call uses wrong argument names.

Fix the module and root configuration so the VPC module is reusable and properly encapsulated.

## Your Task

The files in `starter/` have **5 bugs**. Find and fix all of them.

### Bug Hunt

1. **Module missing `variable "cidr_block"`** — root calls the module with `cidr_block` but the module doesn't declare that variable
2. **Module output missing** — `modules/vpc/outputs.tf` is empty but root module references `module.vpc.vpc_id`
3. **Root module call uses wrong argument** — `cidr = "10.0.0.0/16"` should be `cidr_block = "10.0.0.0/16"`
4. **Module source path wrong** — `source = "./module/vpc"` (singular) but directory is `./modules/vpc` (plural)
5. **Missing `required_providers` in module** — module doesn't need providers block but the root module source block needs the right path

## Acceptance Criteria

- [ ] `terraform init` resolves the module from `./modules/vpc`
- [ ] Module accepts `cidr_block` and `name` as inputs
- [ ] Module outputs `vpc_id` and `subnet_ids`
- [ ] Root module accesses `module.vpc.vpc_id` successfully
- [ ] `terraform validate` passes the module and root config

## Learning Notes

**Module structure:**
```
modules/
  vpc/
    main.tf       # resources
    variables.tf  # input variables
    outputs.tf    # output values
```

**Calling a module:**
```hcl
module "vpc" {
  source = "./modules/vpc"   # local path

  cidr_block = "10.0.0.0/16"
  name       = "prod-vpc"
}

# Access module outputs
resource "aws_instance" "web" {
  subnet_id = module.vpc.subnet_ids[0]
}
```
