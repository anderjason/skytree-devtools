import { ExampleDefinition, ExamplesHome } from "@anderjason/example-tools";
import { ObservableArray } from "@anderjason/observable";

const definitions = ObservableArray.givenValues<ExampleDefinition>([]);

const main = new ExamplesHome({
  title: "example-tools",
  definitions,
});
main.activate();
