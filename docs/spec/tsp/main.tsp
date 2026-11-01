import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";
import "./models.tsp";
import "./errors.tsp";
import "./routes.tsp";

using TypeSpec.OpenAPI;

@service(#{ title: "Календарь звонков API" })
@info(#{ version: "1.0.0" })
namespace CalendarApi;
