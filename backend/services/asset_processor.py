import bpy


def process_asset(input_path, output_path):
    print(f"Loading: {input_path}")

    # Clear the default Blender scene
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    # Import the GLB
    bpy.ops.import_scene.gltf(filepath=input_path)

    print("GLB imported successfully.")

    # Find mesh objects
    mesh_objects = [
        obj for obj in bpy.context.scene.objects
        if obj.type == "MESH"
    ]

    print(f"Mesh objects found: {len(mesh_objects)}")

    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB"
    )

    print(f"Exported: {output_path}")


if __name__ == "__main__":
    print("3DForge Asset Processor started")
